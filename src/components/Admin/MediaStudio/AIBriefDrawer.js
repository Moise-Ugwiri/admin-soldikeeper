/* eslint-disable */
import React, { useState } from 'react';
import {
  Drawer, Box, Typography, TextField, Button, FormControl,
  InputLabel, Select, MenuItem, CircularProgress, IconButton,
  Alert, Divider
} from '@mui/material';
import { Close as CloseIcon, AutoAwesome as AIIcon } from '@mui/icons-material';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const PLATFORMS = ['TikTok', 'Instagram', 'YouTube', 'LinkedIn', 'Feature Spotlight'];
const TONES = ['energetic', 'professional', 'friendly', 'urgent'];
const AUDIENCES = ['young adults (18-30)', 'millennials (25-40)', 'freelancers', 'small business owners', 'budget-conscious families'];

const AIBriefDrawer = ({ open, onClose, selectedTemplate, authHeader, onApply }) => {
  const [brief, setBrief] = useState('');
  const [tone, setTone] = useState('energetic');
  const [audience, setAudience] = useState('young adults (18-30)');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleGenerate = async () => {
    if (!brief.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${API_URL}/admin/media/ai-brief`, {
        method: 'POST',
        headers: { ...authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: selectedTemplate,
          brief: brief.trim(),
          tone,
          audience,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResult(data.inputProps);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (result) {
      onApply(result);
      onClose();
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 400, p: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AIIcon sx={{ color: '#10b981' }} />
          <Typography variant="h6" fontWeight={700}>AI Copy Generator</Typography>
        </Box>
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Describe your campaign goal and Claude will generate hooks, copy, and CTAs for your video.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="What's the goal of this video?"
          placeholder="e.g. Show students how SoldiKeeper helps them track their food budget"
          multiline
          rows={3}
          value={brief}
          onChange={e => setBrief(e.target.value)}
          fullWidth
        />

        <FormControl fullWidth size="small">
          <InputLabel>Target Audience</InputLabel>
          <Select value={audience} onChange={e => setAudience(e.target.value)} label="Target Audience">
            {AUDIENCES.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel>Tone</InputLabel>
          <Select value={tone} onChange={e => setTone(e.target.value)} label="Tone">
            {TONES.map(t => <MenuItem key={t} value={t} sx={{ textTransform: 'capitalize' }}>{t}</MenuItem>)}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          onClick={handleGenerate}
          disabled={loading || !brief.trim()}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <AIIcon />}
          sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
        >
          {loading ? 'Generating…' : 'Generate Copy'}
        </Button>

        {error && <Alert severity="error">{error}</Alert>}

        {result && (
          <Box>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Generated Content</Typography>
            <Box sx={{ bgcolor: 'action.hover', borderRadius: 2, p: 2, fontSize: 13 }}>
              <Typography variant="body2"><strong>Hook:</strong> {result.hook}</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}><strong>Subtitle:</strong> {result.subtitle}</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}><strong>CTA:</strong> {result.ctaText}</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}><strong>Features:</strong> {(result.features || []).join(', ')}</Typography>
            </Box>
            <Button
              variant="outlined"
              fullWidth
              sx={{ mt: 1.5, borderColor: '#10b981', color: '#10b981' }}
              onClick={handleApply}
            >
              Apply to Editor
            </Button>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default AIBriefDrawer;
