/* eslint-disable */
import React, { useState, useCallback } from 'react';
import {
  Box, Grid, Typography, Paper, Tabs, Tab
} from '@mui/material';
import {
  VideoLibrary as VideoLibraryIcon,
  AutoAwesome as AutoAwesomeStudioIcon,
  VideoLibrary as VideoLibraryStudioIcon,
} from '@mui/icons-material';

import AIVideoTab from './AIVideoTab';
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
  contentType: 'promotional',
};

const MediaStudio = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState('TikTok');
  const [inputProps, setInputProps] = useState({ ...DEFAULT_PROPS });
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const handlePropsChange = useCallback((newProps) => {
    setInputProps(newProps);
  }, []);

  const handleTemplateSelect = (templateId) => {
    setSelectedTemplate(templateId);
  };

  const handleAIApply = (generatedProps) => {
    setInputProps((prev) => ({ ...prev, ...generatedProps }));
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <VideoLibraryIcon sx={{ color: '#10b981', fontSize: 28 }} />
        <Box>
          <Typography variant="h5" fontWeight={800} lineHeight={1.1}>Media Studio</Typography>
          <Typography variant="body2" color="text.secondary">
            Build custom social media videos powered by AI
          </Typography>
        </Box>
      </Box>

      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 2 }}>
        <Tab icon={<VideoLibraryStudioIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Remotion Studio" />
        <Tab icon={<AutoAwesomeStudioIcon sx={{ fontSize: 18, color: activeTab === 1 ? '#8b5cf6' : 'inherit' }} />} iconPosition="start" label="AI Video" />
      </Tabs>

      {activeTab === 0 && (
        <>
          <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
            <TemplatePicker selected={selectedTemplate} onSelect={handleTemplateSelect} />
          </Paper>

          <Grid container spacing={2} sx={{ flexGrow: 1 }}>
            <Grid item xs={12} md={5}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                <ContentEditor
                  inputProps={inputProps}
                  onPropsChange={handlePropsChange}
                  onOpenAI={() => setAiDrawerOpen(true)}
                />
              </Paper>
            </Grid>

            <Grid item xs={12} md={7}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <PreviewPane
                    compositionId={selectedTemplate}
                    inputProps={inputProps}
                  />
                </Paper>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <OutputPanel
                    compositionId={selectedTemplate}
                    inputProps={inputProps}
                    onOpenLibrary={() => setLibraryOpen(true)}
                  />
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </>
      )}

      {activeTab === 1 && (
        <AIVideoTab />
      )}

      <AIBriefDrawer
        open={aiDrawerOpen}
        onClose={() => setAiDrawerOpen(false)}
        selectedTemplate={selectedTemplate}
        inputProps={inputProps}
        onApply={handleAIApply}
      />
      <VideoLibraryDrawer
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
      />
    </Box>
  );
};

export default MediaStudio;