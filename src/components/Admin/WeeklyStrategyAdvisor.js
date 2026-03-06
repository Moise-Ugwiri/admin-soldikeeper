import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Paper, Typography, Button, Chip, Alert, Skeleton, alpha
} from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import { getWeeklyStrategy } from '../../services/growthAPI';

const PRIORITY_CONFIG = {
  P0: { color: '#F44336', label: 'CRITICAL', icon: WarningIcon },
  P1: { color: '#FF6B35', label: 'HIGH', icon: FlashOnIcon },
  P2: { color: '#00C853', label: 'MEDIUM', icon: TrendingUpIcon },
};

export default function WeeklyStrategyAdvisor() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getWeeklyStrategy();
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load strategy');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <Paper sx={{ p: 3, background: alpha('#7C4DFF', 0.05), border: '1px solid', borderColor: alpha('#7C4DFF', 0.2) }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PsychologyIcon sx={{ color: '#7C4DFF' }} />
          <Typography variant="h6" fontWeight="bold">AI Growth Strategist</Typography>
          <Chip label="WEEKLY BRIEF" size="small" sx={{ background: alpha('#7C4DFF', 0.2), color: '#7C4DFF' }} />
        </Box>
        <Button size="small" startIcon={<RefreshIcon />} onClick={fetchData} disabled={loading}>
          Refresh
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {loading ? (
        [1, 2, 3, 4, 5].map(i => <Skeleton key={i} height={80} sx={{ mb: 1 }} />)
      ) : data?.recommendations?.map((rec, i) => {
        const config = PRIORITY_CONFIG[rec.priority] || PRIORITY_CONFIG.P2;
        const Icon = config.icon;
        return (
          <Box key={i} sx={{ display: 'flex', gap: 2, mb: 2, p: 2, background: alpha(config.color, 0.05), borderRadius: 1, borderLeft: `3px solid ${config.color}` }}>
            <Icon sx={{ color: config.color, mt: 0.3, flexShrink: 0 }} />
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Chip label={config.label} size="small" sx={{ background: alpha(config.color, 0.15), color: config.color, fontSize: '0.65rem' }} />
                <Chip label={rec.effort} size="small" variant="outlined" sx={{ fontSize: '0.65rem' }} />
                <Typography variant="caption" color="text.secondary">{rec.impact}</Typography>
              </Box>
              <Typography variant="subtitle2" fontWeight="bold">{rec.title}</Typography>
              <Typography variant="body2" color="text.secondary">{rec.action}</Typography>
            </Box>
          </Box>
        );
      })}

      {data?.generatedAt && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          Generated: {new Date(data.generatedAt).toLocaleString()}
        </Typography>
      )}
    </Paper>
  );
}
