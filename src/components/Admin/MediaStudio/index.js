/* eslint-disable */
import React, { useState, useCallback } from 'react';
import {
  Box, Grid, Typography, Paper, Divider
} from '@mui/material';
import { VideoLibrary as VideoLibraryIcon } from '@mui/icons-material';

import TemplatePicker from './TemplatePicker';
import ContentEditor from './ContentEditor';
import PreviewPane from './PreviewPane';
import OutputPanel from './OutputPanel';
import AIBriefDrawer from './AIBriefDrawer';
import VideoLibraryDrawer from './VideoLibraryDrawer';

const DEFAULT_PROPS = {
  hook: 'Stop losing your receipts',
  subtitle: 'Track every expense automatically',
  features: ['Receipt OCR', 'Smart Budgets', 'SplitSmart'],
  ctaText: 'Try SoldiKeeper Free',
  ctaUrl: 'https://soldikeeper.com',
  accentColor: '#10b981',
  theme: 'green',
  tone: 'energetic',
};

const MediaStudio = () => {
  const token = localStorage.getItem('token');
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const [selectedTemplate, setSelectedTemplate] = useState('TikTok');
  const [inputProps, setInputProps] = useState({ ...DEFAULT_PROPS });
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const handlePropsChange = useCallback((newProps) => {
    setInputProps(newProps);
  }, []);

  const handleTemplateSelect = (templateId) => {
    setSelectedTemplate(templateId);
    // Reset render state when template changes (OutputPanel handles this internally)
  };

  const handleAIApply = (generatedProps) => {
    setInputProps(prev => ({ ...prev, ...generatedProps }));
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <VideoLibraryIcon sx={{ color: '#10b981', fontSize: 28 }} />
        <Box>
          <Typography variant="h5" fontWeight={800} lineHeight={1.1}>Media Studio</Typography>
          <Typography variant="body2" color="text.secondary">
            Build custom social media videos powered by AI
          </Typography>
        </Box>
      </Box>

      {/* Template Picker (full width) */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <TemplatePicker selected={selectedTemplate} onSelect={handleTemplateSelect} />
      </Paper>

      {/* Main two-column layout */}
      <Grid container spacing={2} sx={{ flexGrow: 1 }}>
        {/* Left: Content Editor */}
        <Grid item xs={12} md={5}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <ContentEditor
              inputProps={inputProps}
              onPropsChange={handlePropsChange}
              onOpenAI={() => setAiDrawerOpen(true)}
            />
          </Paper>
        </Grid>

        {/* Right: Preview + Output */}
        <Grid item xs={12} md={7}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <PreviewPane
                compositionId={selectedTemplate}
                inputProps={inputProps}
                authHeader={authHeader}
              />
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <OutputPanel
                compositionId={selectedTemplate}
                inputProps={inputProps}
                authHeader={authHeader}
                onOpenLibrary={() => setLibraryOpen(true)}
              />
            </Paper>
          </Box>
        </Grid>
      </Grid>

      {/* Drawers */}
      <AIBriefDrawer
        open={aiDrawerOpen}
        onClose={() => setAiDrawerOpen(false)}
        selectedTemplate={selectedTemplate}
        authHeader={authHeader}
        onApply={handleAIApply}
      />
      <VideoLibraryDrawer
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        authHeader={authHeader}
      />
    </Box>
  );
};

export default MediaStudio;
