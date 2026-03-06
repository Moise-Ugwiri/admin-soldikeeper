// CampaignDrafter.js
import React, { useState } from 'react';
import {
  Box, Paper, Typography, Select, MenuItem, FormControl, InputLabel,
  Button, Chip, CircularProgress, Alert, Grid, alpha
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { draftCampaign } from '../../services/growthAPI';

const AUDIENCES = ['free users', 'trial users about to expire', 'inactive premium users', 'standard users for upsell', 'cancelled users for win-back', 'all users'];
const TONES = ['friendly', 'urgent', 'professional', 'exciting', 'empathetic'];
const OBJECTIVES = [
  'convert free users to paid',
  'upgrade standard to premium',
  'reactivate cancelled users',
  're-engage inactive users',
  'promote annual billing discount',
  'announce new feature',
];

export default function CampaignDrafter() {
  const [objective, setObjective] = useState(OBJECTIVES[0]);
  const [audience, setAudience] = useState(AUDIENCES[0]);
  const [tone, setTone] = useState('friendly');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleDraft = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await draftCampaign({ objective, audience, tone });
      setResult(res.data.campaign);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box>
      <Paper sx={{ p: 3, background: alpha('#00C853', 0.05), border: '1px solid', borderColor: alpha('#00C853', 0.2) }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <AutoAwesomeIcon sx={{ color: '#00C853' }} />
          <Typography variant="h6" fontWeight="bold">AI Campaign Drafter</Typography>
          <Chip label="AUTOPILOT" size="small" sx={{ background: '#00C853', color: '#000', fontWeight: 'bold', ml: 1 }} />
        </Box>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Objective</InputLabel>
              <Select value={objective} onChange={e => setObjective(e.target.value)} label="Objective">
                {OBJECTIVES.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Audience</InputLabel>
              <Select value={audience} onChange={e => setAudience(e.target.value)} label="Audience">
                {AUDIENCES.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Tone</InputLabel>
              <Select value={tone} onChange={e => setTone(e.target.value)} label="Tone">
                {TONES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Button
          variant="contained"
          onClick={handleDraft}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : <AutoAwesomeIcon />}
          sx={{ background: '#00C853', color: '#000', fontWeight: 'bold', '&:hover': { background: '#00a844' } }}
        >
          {loading ? 'Drafting...' : 'Draft Campaign with AI'}
        </Button>
      </Paper>

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

      {result && (
        <Paper sx={{ p: 3, mt: 2, background: alpha('#fff', 0.03) }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">Generated Campaign</Typography>
          <Grid container spacing={2}>
            {[
              { label: 'Subject Line (A)', value: result.subject },
              { label: 'Subject Line (B)', value: result.subjectB },
              { label: 'Preview Text', value: result.previewText },
              { label: 'Headline', value: result.headline },
              { label: 'CTA Text', value: result.cta },
              { label: 'Target Audience', value: result.audience },
              { label: 'Best Send Time', value: result.bestSendTime },
              { label: 'Expected Open Rate', value: result.expectedOpenRate },
              { label: 'Expected Conversion', value: result.expectedConversionRate },
            ].map(({ label, value }) => value ? (
              <Grid item xs={12} md={6} key={label}>
                <Box sx={{ p: 1.5, background: alpha('#fff', 0.05), borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">{label}</Typography>
                  <Typography variant="body2" fontWeight="bold">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</Typography>
                </Box>
              </Grid>
            ) : null)}
            {result.body && (
              <Grid item xs={12}>
                <Box sx={{ p: 1.5, background: alpha('#fff', 0.05), borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">Email Body</Typography>
                    <Button size="small" startIcon={<ContentCopyIcon />} onClick={() => handleCopy(result.body)}>
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </Box>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{typeof result.body === 'object' ? JSON.stringify(result.body, null, 2) : result.body}</Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </Paper>
      )}
    </Box>
  );
}
