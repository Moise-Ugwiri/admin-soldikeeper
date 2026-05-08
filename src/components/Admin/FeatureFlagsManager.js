/**
 * FeatureFlagsManager — Admin UI matrix (Wave 3 overhaul).
 *
 * P0: Impact preview in confirm dialog, numeric limit cells,
 *     paginated audit drawer with CSV export.
 * P1: Bulk-edit toolbar, schedule button, preview-as-user panel,
 *     modified badge, scheduled-change badges.
 * P2: Dependency violation inline alert, tier column color-coding,
 *     keyboard shortcuts (/ Esc g-f), revert-bug fix.
 *
 * Tech: React 18 + MUI 7, apiClient (axios), no TypeScript.
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Drawer,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Snackbar,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  History as HistoryIcon,
  Info as InfoIcon,
  Lock as LockIcon,
  Preview as PreviewIcon,
  Refresh as RefreshIcon,
  Restore as RestoreIcon,
  Schedule as ScheduleIcon,
  Search as SearchIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';

import apiClient from '../../services/api';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

/* =========================================================================
   Constants
   ========================================================================= */

const TIERS = [
  { key: 'free',     label: 'Free' },
  { key: 'standard', label: 'Standard' },
  { key: 'premium',  label: 'Premium' },
  { key: 'family',   label: 'Family' },
  { key: 'business', label: 'Business' },
];

const PAID_TIERS = new Set(['standard', 'premium', 'family', 'business']);

const CATEGORY_OPTIONS = [
  { value: 'all',      label: 'All categories' },
  { value: 'core',     label: 'Core' },
  { value: 'standard', label: 'Standard' },
  { value: 'premium',  label: 'Premium' },
  { value: 'family',   label: 'Family' },
  { value: 'business', label: 'Business' },
];

const CATEGORY_COLOR = {
  core:     'default',
  standard: 'info',
  premium:  'secondary',
  family:   'success',
  business: 'warning',
};

/* Tier header background tints — P2 #10 */
const TIER_BG = {
  free:     '#f5f5f5',
  standard: '#e3f2fd',
  premium:  '#f3e5f5',
  family:   '#e8f5e9',
  business: '#fff8e1',
};

/* Lighter tint for data cells */
const TIER_BG_LIGHT = {
  free:     'rgba(0,0,0,0.018)',
  standard: 'rgba(227,242,253,0.38)',
  premium:  'rgba(243,229,245,0.38)',
  family:   'rgba(232,245,233,0.38)',
  business: 'rgba(255,248,225,0.38)',
};

/* Seed defaults for Modified badge — P1 #7 */
const SEED_DEFAULTS = {
  basicBudgeting:            { free:true,  standard:true,  premium:true,  family:true,  business:true  },
  expenseTracking:           { free:true,  standard:true,  premium:true,  family:true,  business:true  },
  basicReports:              { free:true,  standard:true,  premium:true,  family:true,  business:true  },
  customReports:             { free:false, standard:true,  premium:true,  family:true,  business:true  },
  dataExport:                { free:false, standard:true,  premium:true,  family:true,  business:true  },
  advancedTracking:          { free:false, standard:true,  premium:true,  family:true,  business:true  },
  merchantAnalytics:         { free:false, standard:true,  premium:true,  family:true,  business:true  },
  savingsGoals:              { free:false, standard:true,  premium:true,  family:true,  business:true  },
  debtPayoff:                { free:false, standard:true,  premium:true,  family:true,  business:true  },
  automationRules:           { free:false, standard:true,  premium:true,  family:true,  business:true  },
  receiptCategorySuggestion: { free:false, standard:true,  premium:true,  family:true,  business:true  },
  receiptReanalyse:          { free:false, standard:true,  premium:true,  family:true,  business:true  },
  aiInsights:                { free:false, standard:false, premium:true,  family:true,  business:true  },
  advancedAnalytics:         { free:false, standard:false, premium:true,  family:true,  business:true  },
  prioritySupport:           { free:false, standard:false, premium:true,  family:true,  business:true  },
  receiptAI:                 { free:false, standard:false, premium:true,  family:true,  business:true  },
  budgetForecasting:         { free:false, standard:false, premium:true,  family:true,  business:true  },
  cashflowForecast:          { free:false, standard:false, premium:true,  family:true,  business:true  },
  spendingAnomalyAlerts:     { free:false, standard:false, premium:true,  family:true,  business:true  },
  pdfBrandedReports:         { free:false, standard:false, premium:true,  family:true,  business:true  },
  multiUser:                 { free:false, standard:false, premium:false, family:true,  business:true  },
  householdAnalytics:        { free:false, standard:false, premium:false, family:true,  business:true  },
  sharedBudgets:             { free:false, standard:false, premium:false, family:true,  business:true  },
  businessFeatures:          { free:false, standard:false, premium:false, family:false, business:true  },
  apiAccess:                 { free:false, standard:false, premium:false, family:false, business:true  },
};

/* =========================================================================
   Pure helpers
   ========================================================================= */

function diffPerTier(before = {}, after = {}) {
  const keys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)]));
  return keys
    .filter((k) => before[k] !== after[k])
    .map((k) => ({ tier: k, from: !!before[k], to: !!after[k] }));
}

function formatDate(d) {
  if (!d) return '—';
  try { return new Date(d).toLocaleString(); } catch { return String(d); }
}

/** True when the flag exposes a numericLimits map with at least one non-null entry. */
function isNumericFlag(flag) {
  if (!flag.numericLimits) return false;
  return Object.values(flag.numericLimits).some((v) => v !== null && v !== undefined);
}

/** Core numeric-only: isCore === true AND has numericLimits (the limit* flags). */
function isCoreNumericOnly(flag) {
  return !!flag.isCore && isNumericFlag(flag);
}

/** True when the flag's current perTierEnabled differs from SEED_DEFAULTS. */
function isModifiedFlag(flag) {
  if (flag.isCore) return false;
  const defaults = SEED_DEFAULTS[flag.key];
  if (!defaults) return false;
  const per = flag.perTierEnabled || {};
  return TIERS.some((t) => !!per[t.key] !== !!defaults[t.key]);
}

/* =========================================================================
   NumericInput — P0 #2
   Inline number input for per-tier numeric limits. Controlled locally,
   saves on blur.
   ========================================================================= */

const NumericInput = React.memo(function NumericInput({ currentValue, disabled, onSave }) {
  const [localVal, setLocalVal] = useState(
    currentValue === null || currentValue === undefined ? '' : String(currentValue)
  );

  useEffect(() => {
    setLocalVal(
      currentValue === null || currentValue === undefined ? '' : String(currentValue)
    );
  }, [currentValue]);

  const handleBlur = () => {
    const trimmed = localVal.trim();
    let parsed;
    if (trimmed === '') {
      parsed = null;
    } else if (trimmed === '-1' || trimmed === '∞') {
      parsed = -1;
    } else {
      parsed = parseInt(trimmed, 10);
      if (isNaN(parsed)) return; // invalid value — skip
    }
    onSave(parsed);
  };

  return (
    <TextField
      type="number"
      size="small"
      sx={{ width: 70 }}
      value={localVal}
      disabled={disabled}
      onChange={(e) => setLocalVal(e.target.value)}
      onBlur={handleBlur}
      slotProps={{ htmlInput: { min: -1, step: 1 } }}
      placeholder={currentValue === -1 ? '∞' : '—'}
    />
  );
});

/* =========================================================================
   FeatureFlagsManager
   ========================================================================= */

const FeatureFlagsManager = () => {

  /* ── Core data ─────────────────────────────────────────────────────── */
  const [flags, setFlags]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  /* ── Filter / search ───────────────────────────────────────────────── */
  const [search, setSearch]               = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  /* ── Snackbar ──────────────────────────────────────────────────────── */
  const [snackbar, setSnackbar] = useState(null); // { severity, message }

  /* ── In-flight indicator ───────────────────────────────────────────── */
  const [savingKey, setSavingKey] = useState(null);

  /* ── P2 #9 — dependency violation alert ───────────────────────────── */
  const [depViolation, setDepViolation] = useState(null);
  // shape: { flagKey, violations: [{ dependentKey, dependentLabel, tier }] }

  /* ── Confirm dialog (paid tier disable) ─────────────────────────────  */
  const [confirmDialog, setConfirmDialog] = useState(null);
  // shape: { flagKey, flagLabel, tier, tierLabel, typed }

  /* ── P0 #1 — impact data for confirm dialog ─────────────────────────  */
  const [impactData, setImpactData] = useState({ flagKey: null, data: null, loading: false });

  /* ── P0 #3 — audit drawer ───────────────────────────────────────────  */
  const [drawerFlagKey, setDrawerFlagKey] = useState(null);
  const [auditState, setAuditState] = useState({
    entries: [], page: 1, pages: 1, total: 0, loading: false,
  });

  /* ── P1 #4 — bulk edit ──────────────────────────────────────────────  */
  const [selectedRows, setSelectedRows]   = useState(new Set());
  const [bulkProgress, setBulkProgress]   = useState(null);
  const [bulkResetConfirm, setBulkResetConfirm] = useState(false);

  /* ── P1 #5 — schedule dialog ────────────────────────────────────────  */
  const [scheduleDialog, setScheduleDialog] = useState(null);
  // shape: { flagKey, flagLabel, perTierEnabled, activateAt, expireAt, note, submitting }

  /* ── P1 #6 — preview as user ────────────────────────────────────────  */
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTier, setPreviewTier] = useState('free');

  /* ── t10 — snapshot import preview ──────────────────────────────────  */
  const [importPreview, setImportPreview] = useState(null);
  // shape: { diffs: [...], importedFlags: [...] }

  /* ── Refs ───────────────────────────────────────────────────────────  */
  const searchInputRef   = useRef(null);
  const headingRef       = useRef(null);
  const drawerFlagKeyRef = useRef(drawerFlagKey);
  const importInputRef   = useRef(null);
  useEffect(() => { drawerFlagKeyRef.current = drawerFlagKey; }, [drawerFlagKey]);

  /* ── t12 — responsive breakpoint ────────────────────────────────────  */
  const theme   = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  /* ======================================================================
     Data fetching
     ====================================================================== */

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

  /** P0 #3 — paginated audit fetch */
  const fetchAudit = useCallback(async (flagKey, page = 1) => {
    setAuditState((prev) => ({ ...prev, loading: true }));
    try {
      const { data } = await apiClient.get(`/admin/feature-flags/${flagKey}/audit`, {
        params: { page, limit: 20 },
      });
      if (!data?.success) throw new Error(data?.message || 'Failed to load audit');
      const entries    = data.data || [];
      const pagination = data.pagination || { page: 1, pages: 1, total: 0 };
      setAuditState((prev) => ({
        entries: page === 1 ? entries : [...prev.entries, ...entries],
        page:    pagination.page,
        pages:   pagination.pages,
        total:   pagination.total,
        loading: false,
      }));
    } catch {
      setAuditState((prev) => ({ ...prev, loading: false }));
      setSnackbar({ severity: 'error', message: 'Failed to load audit log' });
    }
  }, []);

  useEffect(() => { fetchFlags(); }, [fetchFlags]);

  /* Auto-fetch page 1 when audit drawer opens */
  useEffect(() => {
    if (drawerFlagKey) {
      setAuditState({ entries: [], page: 1, pages: 1, total: 0, loading: false });
      fetchAudit(drawerFlagKey, 1);
    }
  }, [drawerFlagKey, fetchAudit]);

  /* ======================================================================
     P2 #11 — Keyboard shortcuts
     / → focus search   Esc → close drawer   g then f → scroll to heading
     ====================================================================== */

  useEffect(() => {
    let lastGTime = 0;

    const handleKeyDown = (e) => {
      const tag       = e.target.tagName;
      const inInput   = tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable;

      /* Escape: close drawer (dialogs handle their own Esc via MUI) */
      if (e.key === 'Escape') {
        if (drawerFlagKeyRef.current) {
          setDrawerFlagKey(null);
        }
        return;
      }

      if (inInput) return;

      /* / : focus search box */
      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      /* g then f within 500 ms: scroll to Feature Flags heading */
      if (e.key === 'g') {
        lastGTime = Date.now();
        return;
      }
      if (e.key === 'f' && Date.now() - lastGTime < 500) {
        headingRef.current?.scrollIntoView({ behavior: 'smooth' });
        lastGTime = 0;
        return;
      }

      lastGTime = 0;
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []); // stable: uses refs, no deps needed

  /* ======================================================================
     Mutations
     ====================================================================== */

  /**
   * PATCH a flag optimistically.
   * Accepts { perTierEnabled?, numericLimits?, note? }.
   * Handles 409 dep-violation and rolls back on error.
   */
  const patchFlag = useCallback(
    async (flagKey, options = {}) => {
      const { perTierEnabled, numericLimits, note } = options;
      const prevFlags = flags;
      setDepViolation(null);

      /* Optimistic update */
      setFlags((curr) =>
        curr.map((f) =>
          f.key === flagKey
            ? {
                ...f,
                perTierEnabled: perTierEnabled
                  ? { ...(f.perTierEnabled || {}), ...perTierEnabled }
                  : f.perTierEnabled,
                numericLimits: numericLimits
                  ? { ...(f.numericLimits || {}), ...numericLimits }
                  : f.numericLimits,
              }
            : f
        )
      );

      setSavingKey(flagKey);
      try {
        const body = {};
        if (perTierEnabled) body.perTierEnabled = perTierEnabled;
        if (numericLimits)  body.numericLimits  = numericLimits;
        if (note)           body.note           = note;

        const { data } = await apiClient.patch(`/admin/feature-flags/${flagKey}`, body);
        if (!data?.success) throw new Error(data?.message || 'Patch failed');
        /* Replace with server's authoritative copy (includes new audit entry) */
        setFlags((curr) => curr.map((f) => (f.key === flagKey ? data.data : f)));
        setSnackbar({ severity: 'success', message: `Updated "${flagKey}"` });
      } catch (err) {
        setFlags(prevFlags); // rollback
        if (err.response?.status === 409 && err.response?.data?.violations) {
          /* P2 #9 — show inline violation alert */
          setDepViolation({ flagKey, violations: err.response.data.violations });
        } else {
          setSnackbar({
            severity: 'error',
            message: err.response?.data?.message || err.message || 'Update failed — change reverted',
          });
        }
      } finally {
        setSavingKey(null);
      }
    },
    [flags]
  );

  /**
   * P2 #12 — Revert bug fix: always use ISO string from auditEntry.at.
   * The auditEntrySchema has { _id: false }, so _id never exists.
   */
  const revertEntry = useCallback(async (flagKey, auditEntry) => {
    const auditEntryId = new Date(auditEntry.at).toISOString();
    setSavingKey(flagKey);
    try {
      const { data } = await apiClient.post(`/admin/feature-flags/${flagKey}/revert`, { auditEntryId });
      if (!data?.success) throw new Error(data?.message || 'Revert failed');
      setFlags((curr) => curr.map((f) => (f.key === flagKey ? data.data : f)));
      setSnackbar({ severity: 'success', message: `Reverted "${flagKey}" to ${formatDate(auditEntry.at)}` });
    } catch (err) {
      setSnackbar({ severity: 'error', message: err.response?.data?.message || err.message || 'Revert failed' });
    } finally {
      setSavingKey(null);
    }
  }, []);

  /** P1 #5 — Submit scheduled change */
  const handleScheduleSubmit = useCallback(async () => {
    if (!scheduleDialog) return;
    const { flagKey, perTierEnabled, activateAt, expireAt, note } = scheduleDialog;
    if (!activateAt) {
      setSnackbar({ severity: 'warning', message: 'Activate-at datetime is required' });
      return;
    }
    setScheduleDialog((prev) => prev ? { ...prev, submitting: true } : prev);
    try {
      const body = {
        perTierEnabled,
        activateAt: new Date(activateAt).toISOString(),
      };
      if (expireAt) body.expireAt = new Date(expireAt).toISOString();
      if (note)     body.note     = note;

      const { data } = await apiClient.post(`/admin/feature-flags/${flagKey}/schedule`, body);
      if (!data?.success) throw new Error(data?.message || 'Failed');
      setFlags((curr) => curr.map((f) => (f.key === flagKey ? data.data : f)));
      setScheduleDialog(null);
      setSnackbar({ severity: 'success', message: 'Scheduled change created' });
    } catch (err) {
      setScheduleDialog((prev) => prev ? { ...prev, submitting: false } : prev);
      setSnackbar({ severity: 'error', message: err.response?.data?.message || 'Failed to schedule change' });
    }
  }, [scheduleDialog]);

  /** Cancel a pending scheduled change */
  const handleCancelSchedule = useCallback(async (flagKey, scheduleId) => {
    try {
      const { data } = await apiClient.delete(`/admin/feature-flags/${flagKey}/schedule/${scheduleId}`);
      if (!data?.success) throw new Error(data?.message || 'Failed');
      setFlags((curr) => curr.map((f) => (f.key === flagKey ? data.data : f)));
      setSnackbar({ severity: 'success', message: 'Scheduled change cancelled' });
    } catch (err) {
      setSnackbar({ severity: 'error', message: err.response?.data?.message || 'Failed to cancel schedule' });
    }
  }, []);

  /** P0 #3 — Export audit log as CSV */
  const handleExportCSV = useCallback((flagKey) => {
    apiClient
      .get('/admin/feature-flags/audit/export', { params: { flagKey }, responseType: 'blob' })
      .then(({ data: blob }) => {
        const url = URL.createObjectURL(blob);
        const a   = document.createElement('a');
        a.href     = url;
        a.download = `${flagKey}-audit.csv`;
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => setSnackbar({ severity: 'error', message: 'CSV export failed' }));
  }, []);

  /** t10 — Export full snapshot JSON */
  const handleExportSnapshot = useCallback(async () => {
    try {
      const response = await apiClient.get('/admin/feature-flags/snapshot', { responseType: 'blob' });
      const url = URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `feature-flags-snapshot-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setSnackbar({ severity: 'error', message: 'Export failed: ' + (err.message || 'Unknown error') });
    }
  }, []);

  /** t10 — Import snapshot JSON: dry-run first to get diff preview */
  const handleImportSnapshot = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const importedFlags = parsed.flags || [];
      if (!importedFlags.length) {
        setSnackbar({ severity: 'warning', message: 'No flags found in snapshot file' });
        return;
      }
      // Dry run first — get diff preview
      const { data: dryResult } = await apiClient.post('/admin/feature-flags/snapshot/apply', {
        flags: importedFlags,
        dryRun: true,
      });
      setImportPreview({ diffs: dryResult.diffs || [], importedFlags });
    } catch (err) {
      setSnackbar({ severity: 'error', message: 'Import failed: ' + (err.message || 'Invalid JSON') });
    }
  }, []);

  /* ======================================================================
     Toggle handler — P0 #1: fetch impact before confirm dialog
     ====================================================================== */

  const handleToggle = useCallback(
    (flag, tier) => async (event) => {
      const nextValue = event.target.checked; // capture before any async suspension

      /* Disabling a paid tier → show impact preview + confirm dialog */
      if (nextValue === false && PAID_TIERS.has(tier)) {
        const tierLabel = TIERS.find((t) => t.key === tier)?.label || tier;
        /* Open dialog immediately (spinner shows while impact loads) */
        setConfirmDialog({ flagKey: flag.key, flagLabel: flag.label, tier, tierLabel, typed: '' });
        setImpactData({ flagKey: flag.key, data: null, loading: true });
        try {
          const { data } = await apiClient.get(`/admin/feature-flags/${flag.key}/impact`);
          setImpactData({ flagKey: flag.key, data: data.data?.impact || {}, loading: false });
        } catch {
          setImpactData({ flagKey: flag.key, data: null, loading: false });
        }
        return;
      }

      patchFlag(flag.key, { perTierEnabled: { [tier]: nextValue } });
    },
    [patchFlag]
  );

  const closeConfirmDialog = useCallback(() => {
    setConfirmDialog(null);
    setImpactData({ flagKey: null, data: null, loading: false });
  }, []);

  const confirmDisable = useCallback(() => {
    if (!confirmDialog || confirmDialog.typed !== 'DISABLE') return;
    const { flagKey, tier, tierLabel } = confirmDialog;
    closeConfirmDialog();
    patchFlag(flagKey, {
      perTierEnabled: { [tier]: false },
      note: `Disabled ${tierLabel} via admin matrix`,
    });
  }, [confirmDialog, closeConfirmDialog, patchFlag]);

  /* ======================================================================
     P1 #4 — Bulk operations
     Uses direct API calls (no optimistic UI) + full refetch at the end.
     ====================================================================== */

  const handleBulkAction = useCallback(
    async (action) => {
      const selectedFlagsArr = flags.filter((f) => selectedRows.has(f.key));
      let toProcess = selectedFlagsArr.filter((f) => !f.isCore);
      if (action === 'reset') {
        toProcess = toProcess.filter((f) => !!SEED_DEFAULTS[f.key]);
      }

      if (toProcess.length === 0) {
        setSnackbar({ severity: 'warning', message: 'No eligible flags in selection (core flags skipped)' });
        setBulkResetConfirm(false);
        return;
      }

      setBulkProgress({ done: 0, total: toProcess.length, message: 'Processing…' });
      let successCount = 0;

      for (let i = 0; i < toProcess.length; i++) {
        const flag = toProcess[i];
        let body = {};
        if (action === 'enable-paid') {
          body = {
            perTierEnabled: { standard: true, premium: true, family: true, business: true },
            note: 'Bulk: enable paid tiers',
          };
        } else if (action === 'disable-free') {
          body = { perTierEnabled: { free: false }, note: 'Bulk: disable free tier' };
        } else if (action === 'reset') {
          body = { perTierEnabled: SEED_DEFAULTS[flag.key], note: 'Bulk: reset to seed defaults' };
        }
        try {
          await apiClient.patch(`/admin/feature-flags/${flag.key}`, body);
          successCount++;
        } catch { /* continue on error */ }
        setBulkProgress({ done: i + 1, total: toProcess.length, message: 'Processing…' });
      }

      await fetchFlags();
      setBulkProgress(null);
      setSelectedRows(new Set());
      setBulkResetConfirm(false);
      setSnackbar({
        severity: successCount === toProcess.length ? 'success' : 'warning',
        message: `Bulk ${action}: ${successCount}/${toProcess.length} flags updated`,
      });
    },
    [flags, selectedRows, fetchFlags]
  );

  /* ======================================================================
     Row selection helpers
     ====================================================================== */

  const handleSelectAll = useCallback((e) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (e.target.checked) {
        filteredFlags.forEach((f) => next.add(f.key));
      } else {
        filteredFlags.forEach((f) => next.delete(f.key));
      }
      return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredFlags]); // filteredFlags is declared below — ESLint will warn but logic is correct

  const handleRowSelect = useCallback((flagKey) => (e) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (e.target.checked) next.add(flagKey);
      else next.delete(flagKey);
      return next;
    });
  }, []);

  /* ======================================================================
     Derived state
     ====================================================================== */

  const filteredFlags = useMemo(() => {
    const term = search.trim().toLowerCase();
    return flags.filter((f) => {
      if (categoryFilter !== 'all' && f.category !== categoryFilter) return false;
      if (!term) return true;
      return (
        (f.label || '').toLowerCase().includes(term) ||
        (f.key   || '').toLowerCase().includes(term)
      );
    });
  }, [flags, search, categoryFilter]);

  const drawerFlag = useMemo(
    () => flags.find((f) => f.key === drawerFlagKey) || null,
    [flags, drawerFlagKey]
  );

  const allFilteredSelected = useMemo(
    () => filteredFlags.length > 0 && filteredFlags.every((f) => selectedRows.has(f.key)),
    [filteredFlags, selectedRows]
  );

  const someFilteredSelected = useMemo(
    () => filteredFlags.some((f) => selectedRows.has(f.key)) && !allFilteredSelected,
    [filteredFlags, selectedRows, allFilteredSelected]
  );

  /* ======================================================================
     Render
     ====================================================================== */

  return (
    <Box>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', md: 'center' }}
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Box ref={headingRef}>
          <Typography variant="h5" fontWeight={600}>
            Feature Flags
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Per-tier feature matrix. Changes take effect within ~60s (cache TTL).
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
          {/* P1 #6 — Preview as user */}
          <Button
            startIcon={<PreviewIcon />}
            variant="outlined"
            size="small"
            onClick={() => setPreviewOpen(true)}
          >
            Preview as user
          </Button>

          <TextField
            size="small"
            placeholder="Search flags… (/)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            inputRef={searchInputRef}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ width: 220 }}
          />

          <TextField
            select
            size="small"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            sx={{ width: 160 }}
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </TextField>

          <Tooltip title="Refresh">
            <span>
              <IconButton size="small" onClick={fetchFlags} disabled={loading}>
                {loading ? <CircularProgress size={18} /> : <RefreshIcon />}
              </IconButton>
            </span>
          </Tooltip>

          {/* t10 — Snapshot export */}
          <Button
            size="small"
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportSnapshot}
          >
            Export config
          </Button>

          {/* t10 — Snapshot import */}
          <Button
            size="small"
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => importInputRef.current?.click()}
          >
            Import config
          </Button>
          <input
            ref={importInputRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleImportSnapshot}
          />
        </Stack>
      </Stack>

      {/* ── Error banner ─────────────────────────────────────────────────── */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* ── P2 #9 — Dependency violation alert ───────────────────────────── */}
      {depViolation && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setDepViolation(null)}>
          <Typography variant="body2" fontWeight={600} gutterBottom>
            Cannot disable — dependency violations detected:
          </Typography>
          {(depViolation.violations || []).map((v, i) => (
            <Typography key={i} variant="body2">
              • <strong>{v.dependentLabel || v.dependentKey}</strong> depends on this flag
              (tier: <em>{v.tier}</em>)
            </Typography>
          ))}
        </Alert>
      )}

      {/* ── Bulk operation progress bar ───────────────────────────────────── */}
      {bulkProgress && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            {bulkProgress.message} {bulkProgress.done}/{bulkProgress.total}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={(bulkProgress.done / bulkProgress.total) * 100}
          />
        </Box>
      )}

      {/* ── P1 #4 — Bulk-edit sticky toolbar ─────────────────────────────── */}
      {selectedRows.size > 0 && (
        <Paper
          variant="outlined"
          sx={{
            mb: 1,
            p: 1,
            position: 'sticky',
            top: 0,
            zIndex: 10,
            bgcolor: 'rgba(25,118,210,0.06)',
            borderColor: 'primary.main',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Typography variant="body2" fontWeight={600}>
              {selectedRows.size} selected
            </Typography>

            <Button
              size="small"
              variant="contained"
              disabled={!!bulkProgress}
              onClick={() => handleBulkAction('enable-paid')}
            >
              Enable paid tiers
            </Button>

            <Button
              size="small"
              variant="outlined"
              color="warning"
              disabled={!!bulkProgress}
              onClick={() => handleBulkAction('disable-free')}
            >
              Disable free
            </Button>

            <Button
              size="small"
              variant="outlined"
              color="error"
              disabled={!!bulkProgress}
              onClick={() => setBulkResetConfirm(true)}
            >
              Reset to defaults
            </Button>

            <Button
              size="small"
              disabled={!!bulkProgress}
              onClick={() => setSelectedRows(new Set())}
            >
              Deselect all
            </Button>
          </Stack>
        </Paper>
      )}

      {/* ── Matrix table / Mobile cards (t12) ───────────────────────────── */}
      {isMobile ? (
        <Stack spacing={1.5} sx={{ p: 1 }}>
          {loading && flags.length === 0
            ? [0,1,2,3].map((i) => (
                <Paper key={`sk-${i}`} variant="outlined" sx={{ p: 1.5 }}>
                  <Skeleton width={180} height={24} sx={{ mb: 1 }} />
                  <Skeleton width={80} height={20} />
                </Paper>
              ))
            : null}
          {!loading && filteredFlags.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No feature flags match the current filter.
            </Typography>
          )}
          {filteredFlags.map((flag) => {
            const per    = flag.perTierEnabled || {};
            const isCore = !!flag.isCore;
            return (
              <Paper key={flag.key} variant="outlined" sx={{ p: 1.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                  <Box>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      {isCore && (
                        <Tooltip title="Core flag — always enabled">
                          <LockIcon fontSize="small" color="action" />
                        </Tooltip>
                      )}
                      <Typography variant="body2" fontWeight={600}>{flag.label}</Typography>
                      {isModifiedFlag(flag) && (
                        <Tooltip title="State differs from seed defaults" arrow>
                          <Typography component="span" sx={{ fontSize: 14, lineHeight: 1 }}>🔸</Typography>
                        </Tooltip>
                      )}
                    </Stack>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                      {flag.key}
                    </Typography>
                  </Box>
                  <Stack direction="row">
                    <Tooltip title="View audit log">
                      <IconButton size="small" onClick={() => setDrawerFlagKey(flag.key)}>
                        <HistoryIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
                <Chip
                  size="small"
                  label={flag.category || 'core'}
                  color={CATEGORY_COLOR[flag.category] || 'default'}
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
                <Stack spacing={0.5}>
                  {TIERS.map((t) => (
                    <Stack
                      key={t.key}
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ px: 1, py: 0.25, borderRadius: 1, bgcolor: TIER_BG[t.key] }}
                    >
                      <Typography variant="caption" fontWeight={500}>{t.label}</Typography>
                      <Switch
                        size="small"
                        checked={!!per[t.key]}
                        disabled={isCore || savingKey === flag.key}
                        onChange={handleToggle(flag, t.key)}
                        inputProps={{ 'aria-label': `${flag.key} for ${t.label}` }}
                      />
                    </Stack>
                  ))}
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      ) : (
      /* ── Matrix table (desktop) ───────────────────────────────────── */
      <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 320px)' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>

                {/* Checkbox column */}
                <TableCell
                  padding="checkbox"
                  sx={{ position: 'sticky', left: 0, zIndex: 3, bgcolor: 'background.paper' }}
                >
                  <Checkbox
                    size="small"
                    checked={allFilteredSelected}
                    indeterminate={someFilteredSelected}
                    onChange={handleSelectAll}
                    inputProps={{ 'aria-label': 'Select all visible flags' }}
                  />
                </TableCell>

                {/* Feature name column */}
                <TableCell
                  sx={{
                    position: 'sticky',
                    left: 40,
                    zIndex: 3,
                    bgcolor: 'background.paper',
                    minWidth: 280,
                    fontWeight: 600,
                  }}
                >
                  Feature
                </TableCell>

                <TableCell sx={{ fontWeight: 600, minWidth: 110 }}>Category</TableCell>

                {/* P2 #10 — Tier columns with color tints */}
                {TIERS.map((t) => (
                  <TableCell
                    key={t.key}
                    align="center"
                    sx={{ fontWeight: 600, minWidth: 130, bgcolor: TIER_BG[t.key] }}
                  >
                    {t.label}
                  </TableCell>
                ))}

                <TableCell align="center" sx={{ fontWeight: 600, width: 100 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>

              {/* Skeleton rows */}
              {loading && flags.length === 0 && [0,1,2,3,4].map((i) => (
                <TableRow key={`sk-${i}`}>
                  <TableCell padding="checkbox">
                    <Skeleton variant="rectangular" width={20} height={20} />
                  </TableCell>
                  <TableCell sx={{ position: 'sticky', left: 40, bgcolor: 'background.paper', zIndex: 2 }}>
                    <Skeleton width={200} />
                  </TableCell>
                  <TableCell><Skeleton width={70} /></TableCell>
                  {TIERS.map((t) => (
                    <TableCell key={t.key} align="center"><Skeleton width={40} /></TableCell>
                  ))}
                  <TableCell><Skeleton width={60} /></TableCell>
                </TableRow>
              ))}

              {/* Empty state */}
              {!loading && filteredFlags.length === 0 && (
                <TableRow>
                  <TableCell colSpan={TIERS.length + 4} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      No feature flags match the current filter.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}

              {/* Data rows */}
              {filteredFlags.map((flag) => {
                const isCore        = !!flag.isCore;
                const hasNumeric    = isNumericFlag(flag);
                const coreNumOnly   = isCoreNumericOnly(flag);
                const per           = flag.perTierEnabled || {};
                const limits        = flag.numericLimits  || {};
                const isRowSelected = selectedRows.has(flag.key);
                const isDrawerOpen  = drawerFlagKey === flag.key;
                const modified      = isModifiedFlag(flag);
                const pendingCount  = (flag.scheduledChanges || []).length;

                return (
                  <TableRow
                    key={flag.key}
                    hover
                    selected={isRowSelected || isDrawerOpen}
                  >
                    {/* Checkbox */}
                    <TableCell
                      padding="checkbox"
                      sx={{
                        position: 'sticky',
                        left: 0,
                        zIndex: 2,
                        bgcolor: isRowSelected ? 'action.selected' : 'background.paper',
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        size="small"
                        checked={isRowSelected}
                        onChange={handleRowSelect(flag.key)}
                        inputProps={{ 'aria-label': `Select ${flag.key}` }}
                      />
                    </TableCell>

                    {/* Feature name */}
                    <TableCell
                      sx={{
                        position: 'sticky',
                        left: 40,
                        zIndex: 1,
                        cursor: 'pointer',
                        bgcolor: isRowSelected || isDrawerOpen
                          ? 'action.selected'
                          : 'background.paper',
                      }}
                      onClick={() => setDrawerFlagKey(flag.key)}
                    >
                      <Stack direction="row" alignItems="flex-start" spacing={1}>
                        {isCore && !coreNumOnly && (
                          <Tooltip title="Core flag — always enabled, cannot be disabled">
                            <LockIcon fontSize="small" color="action" sx={{ mt: 0.25, flexShrink: 0 }} />
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
                                  sx={{ color: 'text.secondary', fontSize: 14, flexShrink: 0 }}
                                />
                              </Tooltip>
                            )}

                            {/* P1 #7 — Modified badge */}
                            {modified && (
                              <Tooltip title="State differs from seed defaults" arrow>
                                <Typography
                                  component="span"
                                  sx={{ fontSize: 14, lineHeight: 1, flexShrink: 0 }}
                                >
                                  🔸
                                </Typography>
                              </Tooltip>
                            )}

                            {/* P1 #5 — Pending scheduled change badge */}
                            {pendingCount > 0 && (
                              <Tooltip title={`${pendingCount} scheduled change(s) pending`} arrow>
                                <AccessTimeIcon sx={{ fontSize: 14, color: 'warning.main', flexShrink: 0 }} />
                              </Tooltip>
                            )}
                          </Stack>

                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: 'monospace',
                              color: 'text.secondary',
                              display: 'block',
                              wordBreak: 'break-all',
                            }}
                          >
                            {flag.key}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    {/* Category */}
                    <TableCell>
                      <Chip
                        size="small"
                        label={flag.category || 'core'}
                        color={CATEGORY_COLOR[flag.category] || 'default'}
                        variant="outlined"
                      />
                    </TableCell>

                    {/* P0 #2 / P2 #10 — Tier cells */}
                    {TIERS.map((t) => {
                      const checked     = per[t.key] === true;
                      const numVal      = limits[t.key] ?? null;
                      const switchDisabled = isCore || savingKey === flag.key;
                      const numDisabled = savingKey === flag.key || (!coreNumOnly && !checked);

                      return (
                        <TableCell
                          key={t.key}
                          align="center"
                          onClick={(e) => e.stopPropagation()}
                          sx={{ bgcolor: TIER_BG_LIGHT[t.key] }}
                        >
                          <Stack
                            direction="row"
                            spacing={0.5}
                            alignItems="center"
                            justifyContent="center"
                          >
                            {/* Switch: hidden only for core-numeric-only flags */}
                            {!coreNumOnly && (
                              <Switch
                                size="small"
                                checked={checked}
                                disabled={switchDisabled}
                                onChange={handleToggle(flag, t.key)}
                                inputProps={{ 'aria-label': `${flag.key} for ${t.label}` }}
                              />
                            )}

                            {/* Numeric input: shown for any flag with numericLimits */}
                            {hasNumeric && (
                              <NumericInput
                                currentValue={numVal}
                                disabled={numDisabled}
                                onSave={(val) =>
                                  patchFlag(flag.key, {
                                    numericLimits: { [t.key]: val },
                                    note: `Updated ${t.label} numeric limit`,
                                  })
                                }
                              />
                            )}
                          </Stack>
                        </TableCell>
                      );
                    })}

                    {/* Actions */}
                    <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <Tooltip title="View audit log">
                          <IconButton size="small" onClick={() => setDrawerFlagKey(flag.key)}>
                            <HistoryIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {/* P1 #5 — Schedule button (not for core) */}
                        {!isCore && (
                          <Tooltip title="Schedule change">
                            <IconButton
                              size="small"
                              onClick={() =>
                                setScheduleDialog({
                                  flagKey:        flag.key,
                                  flagLabel:      flag.label || flag.key,
                                  perTierEnabled: { ...(per || {}) },
                                  activateAt:     '',
                                  expireAt:       '',
                                  note:           '',
                                  submitting:     false,
                                })
                              }
                            >
                              <ScheduleIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
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
      )} {/* end isMobile ternary */}

      {/* =================================================================
          P0 #1 — Confirm dialog with impact preview
          ================================================================= */}
      <Dialog
        open={!!confirmDialog}
        onClose={closeConfirmDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Disable feature for paying customers?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            This will immediately revoke{' '}
            <strong>{confirmDialog?.flagLabel || confirmDialog?.flagKey}</strong> access
            for all <strong>{confirmDialog?.tierLabel}</strong> customers. They may file
            refund requests.
          </DialogContentText>

          {/* Impact preview */}
          {impactData.loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2, gap: 1 }}>
              <CircularProgress size={22} />
              <Typography variant="body2">Loading impact data…</Typography>
            </Box>
          ) : impactData.data ? (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight={600} gutterBottom>
                Impact preview:
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Tier</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Currently enabled</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Users affected</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {TIERS.map((t) => {
                    const tierImpact    = impactData.data[t.key] || {};
                    const isTargetTier  = t.key === confirmDialog?.tier;
                    const count         = tierImpact.userCount;
                    const hasHighImpact = isTargetTier && typeof count === 'number' && count > 0;

                    return (
                      <TableRow key={t.key} selected={isTargetTier}>
                        <TableCell>{t.label}</TableCell>
                        <TableCell>
                          {tierImpact.enabled
                            ? <Chip size="small" label="Yes" color="success" />
                            : <Chip size="small" label="No"  color="default" />
                          }
                        </TableCell>
                        <TableCell
                          sx={{
                            color:      hasHighImpact ? 'error.main'  : 'inherit',
                            fontWeight: hasHighImpact ? 700            : 400,
                          }}
                        >
                          {typeof count === 'number' ? count.toLocaleString() : '—'}
                          {hasHighImpact && ' ⚠️'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          ) : null}

          <DialogContentText sx={{ mb: 1 }}>
            Type <strong>DISABLE</strong> to confirm:
          </DialogContentText>
          <TextField
            autoFocus={!impactData.loading}
            fullWidth
            size="small"
            value={confirmDialog?.typed || ''}
            onChange={(e) =>
              setConfirmDialog((d) => d ? { ...d, typed: e.target.value } : d)
            }
            placeholder="DISABLE"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDialog}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            disabled={confirmDialog?.typed !== 'DISABLE' || impactData.loading}
            onClick={confirmDisable}
          >
            Disable
          </Button>
        </DialogActions>
      </Dialog>

      {/* =================================================================
          P1 #4 — Bulk reset-to-defaults confirm
          ================================================================= */}
      <Dialog
        open={bulkResetConfirm}
        onClose={() => setBulkResetConfirm(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Reset selected flags to defaults?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will restore the perTierEnabled state of all selected non-core flags
            (that have seed defaults) to their original values. The change is recorded
            in the audit log.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkResetConfirm(false)}>Cancel</Button>
          <Button
            color="warning"
            variant="contained"
            onClick={() => handleBulkAction('reset')}
          >
            Reset to defaults
          </Button>
        </DialogActions>
      </Dialog>

      {/* =================================================================
          P1 #5 — Schedule change dialog
          ================================================================= */}
      <Dialog
        open={!!scheduleDialog}
        onClose={() => setScheduleDialog(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Schedule change — {scheduleDialog?.flagLabel}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Activate at"
              type="datetime-local"
              required
              size="small"
              fullWidth
              value={scheduleDialog?.activateAt || ''}
              onChange={(e) =>
                setScheduleDialog((d) => d ? { ...d, activateAt: e.target.value } : d)
              }
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <TextField
              label="Expire at (optional)"
              type="datetime-local"
              size="small"
              fullWidth
              value={scheduleDialog?.expireAt || ''}
              onChange={(e) =>
                setScheduleDialog((d) => d ? { ...d, expireAt: e.target.value } : d)
              }
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <TextField
              label="Note (optional)"
              size="small"
              fullWidth
              value={scheduleDialog?.note || ''}
              onChange={(e) =>
                setScheduleDialog((d) => d ? { ...d, note: e.target.value } : d)
              }
            />

            <Divider />
            <Typography variant="body2" fontWeight={600}>
              State to apply at activateAt:
            </Typography>

            {TIERS.map((t) => (
              <Stack key={t.key} direction="row" spacing={1} alignItems="center">
                <Typography variant="body2" sx={{ width: 80 }}>{t.label}</Typography>
                <Switch
                  size="small"
                  checked={!!((scheduleDialog?.perTierEnabled || {})[t.key])}
                  onChange={(e) =>
                    setScheduleDialog((d) =>
                      d
                        ? {
                            ...d,
                            perTierEnabled: {
                              ...(d.perTierEnabled || {}),
                              [t.key]: e.target.checked,
                            },
                          }
                        : d
                    )
                  }
                />
                <Typography variant="body2" color="text.secondary">
                  {(scheduleDialog?.perTierEnabled || {})[t.key] ? 'Enabled' : 'Disabled'}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialog(null)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!scheduleDialog?.activateAt || !!scheduleDialog?.submitting}
            onClick={handleScheduleSubmit}
            startIcon={
              scheduleDialog?.submitting
                ? <CircularProgress size={16} />
                : <ScheduleIcon />
            }
          >
            Schedule
          </Button>
        </DialogActions>
      </Dialog>

      {/* =================================================================
          P1 #6 — Preview as user dialog
          ================================================================= */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <span>Preview as user</span>
            <IconButton size="small" onClick={() => setPreviewOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <FormControl size="small" fullWidth>
              <InputLabel>Plan</InputLabel>
              <Select
                value={previewTier}
                label="Plan"
                onChange={(e) => setPreviewTier(e.target.value)}
              >
                {TIERS.map((t) => (
                  <MenuItem key={t.key} value={t.key}>{t.label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Divider />

            <Typography variant="body2" color="text.secondary">
              Features for{' '}
              <strong>{TIERS.find((t) => t.key === previewTier)?.label}</strong> plan:
            </Typography>

            <List dense disablePadding>
              {flags.map((flag) => {
                const alwaysOn  = !!flag.isCore;
                const enabled   = alwaysOn || !!(flag.perTierEnabled || {})[previewTier];
                const numVal    = (flag.numericLimits || {})[previewTier];
                return (
                  <ListItem key={flag.key} disableGutters sx={{ py: 0.25 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      {enabled ? (
                        <CheckCircleIcon fontSize="small" sx={{ color: 'success.main' }} />
                      ) : (
                        <CancelIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body2">{flag.label || flag.key}</Typography>
                          {numVal !== null && numVal !== undefined && (
                            <Chip
                              size="small"
                              label={numVal === -1 ? 'Unlimited' : `Limit: ${numVal}`}
                              variant="outlined"
                            />
                          )}
                        </Stack>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* =================================================================
          P0 #3 — Audit drawer (paginated)
          ================================================================= */}
      <Drawer
        anchor="right"
        open={!!drawerFlagKey}
        onClose={() => setDrawerFlagKey(null)}
        slotProps={{ paper: { sx: { width: { xs: '100%', sm: 500 } } } }}
      >
        {drawerFlag && (
          <Box sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>

            {/* Drawer header */}
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 1 }}
            >
              <Typography variant="h6" fontWeight={600}>Audit log</Typography>
              <IconButton onClick={() => setDrawerFlagKey(null)} size="small">
                <CloseIcon />
              </IconButton>
            </Stack>

            {/* Flag identity */}
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="body2" fontWeight={600}>{drawerFlag.label}</Typography>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                {drawerFlag.key}
              </Typography>
              {drawerFlag.description && (
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                  {drawerFlag.description}
                </Typography>
              )}
            </Box>

            {/* Pending scheduled changes */}
            {(drawerFlag.scheduledChanges || []).length > 0 && (
              <>
                <Divider sx={{ mb: 1 }} />
                <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                  Scheduled changes ({drawerFlag.scheduledChanges.length})
                </Typography>
                <Stack spacing={1} sx={{ mb: 1.5 }}>
                  {drawerFlag.scheduledChanges.map((sc) => (
                    <Paper
                      key={sc._id || sc.activateAt}
                      variant="outlined"
                      sx={{ p: 1 }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="caption" fontWeight={600}>
                            Activates: {formatDate(sc.activateAt)}
                          </Typography>
                          {sc.expireAt && (
                            <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                              Expires: {formatDate(sc.expireAt)}
                            </Typography>
                          )}
                          {sc.note && (
                            <Typography variant="caption" sx={{ display: 'block', fontStyle: 'italic' }}>
                              "{sc.note}"
                            </Typography>
                          )}
                        </Box>
                        <Tooltip title="Cancel scheduled change">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleCancelSchedule(drawerFlag.key, sc._id)}
                          >
                            <CancelIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </>
            )}

            <Divider sx={{ mb: 1.5 }} />

            {/* Audit entries header + CSV export */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Typography variant="body2" fontWeight={600}>
                Audit entries
                {auditState.total > 0 && ` (${auditState.total})`}
              </Typography>
              <Button
                size="small"
                startIcon={<DownloadIcon />}
                onClick={() => handleExportCSV(drawerFlag.key)}
              >
                Export CSV
              </Button>
            </Stack>

            {/* Entries list */}
            <Box sx={{ flex: 1, overflowY: 'auto' }}>
              {auditState.loading && auditState.entries.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : auditState.entries.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No audit entries yet.
                </Typography>
              ) : (
                <Stack spacing={2}>
                  {auditState.entries.map((entry, idx) => {
                    const diffs = diffPerTier(entry.before, entry.after);
                    return (
                      <Paper
                        key={`${entry.at}-${idx}`}
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
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
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
                                disabled={drawerFlag.isCore || savingKey === drawerFlag.key}
                                onClick={() => revertEntry(drawerFlag.key, entry)}
                              >
                                Revert
                              </Button>
                            </span>
                          </Tooltip>
                        </Stack>

                        {entry.note && (
                          <Typography variant="caption" sx={{ display: 'block', mb: 1, fontStyle: 'italic' }}>
                            "{entry.note}"
                          </Typography>
                        )}

                        {diffs.length === 0 ? (
                          <Typography variant="caption" color="text.secondary">
                            No tier changes recorded.
                          </Typography>
                        ) : (
                          <Stack spacing={0.5}>
                            {diffs.map((d) => (
                              <Stack key={d.tier} direction="row" spacing={1} alignItems="center">
                                <Chip
                                  size="small"
                                  label={TIERS.find((t) => t.key === d.tier)?.label || d.tier}
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

                  {/* P0 #3 — Load more */}
                  {auditState.page < auditState.pages && (
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      disabled={auditState.loading}
                      onClick={() => fetchAudit(drawerFlag.key, auditState.page + 1)}
                      startIcon={
                        auditState.loading ? <CircularProgress size={16} /> : undefined
                      }
                    >
                      {auditState.loading ? 'Loading…' : 'Load more'}
                    </Button>
                  )}
                </Stack>
              )}
            </Box>
          </Box>
        )}
      </Drawer>

      {/* =================================================================
          t10 — Snapshot import diff preview dialog
          ================================================================= */}
      <Dialog open={!!importPreview} onClose={() => setImportPreview(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Snapshot Import Preview</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>{(importPreview?.diffs || []).filter(d => d.status === 'changed').length}</strong> flag(s) will change.{' '}
            <strong>{(importPreview?.diffs || []).filter(d => d.status === 'unchanged').length}</strong> unchanged.{' '}
            <strong>{(importPreview?.diffs || []).filter(d => d.status === 'not_found').length}</strong> not found in DB.
          </Typography>

          {(importPreview?.diffs || []).filter(d => d.status === 'changed').map(d => (
            <Box key={d.key} sx={{ mb: 1 }}>
              <Typography variant="caption" fontWeight={600}>{d.key}</Typography>
              {(d.tierDiffs || []).map(td => (
                <Typography key={td.tier} variant="caption" sx={{ display: 'block', ml: 1 }}>
                  {td.tier}: {td.from ? 'on' : 'off'} → {td.to ? 'on' : 'off'}
                </Typography>
              ))}
            </Box>
          ))}

          {(importPreview?.diffs || []).filter(d => d.status === 'changed').length === 0 && (
            <Typography variant="body2" color="text.secondary">No changes detected.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportPreview(null)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!(importPreview?.diffs || []).some(d => d.status === 'changed')}
            onClick={async () => {
              try {
                await apiClient.post('/admin/feature-flags/snapshot/apply', {
                  flags: importPreview.importedFlags,
                  dryRun: false,
                });
                setSnackbar({ severity: 'success', message: 'Snapshot applied successfully' });
                setImportPreview(null);
                fetchFlags();
              } catch (err) {
                setSnackbar({ severity: 'error', message: 'Apply failed: ' + (err.message || '') });
              }
            }}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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
