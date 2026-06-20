import React, { useState } from 'react';
import {
  Box, Typography, Button, Accordion, AccordionSummary, AccordionDetails, Tabs, Tab,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import FolderIcon from '@mui/icons-material/Folder';
import PipelineHealthBanner from './PipelineHealthBanner';
import CreateWizard from './CreateWizard';
import UnifiedAssetLibrary from './UnifiedAssetLibrary';
import TemplatePicker from './TemplatePicker';
import ContentEditor from './ContentEditor';
import PreviewPane from './PreviewPane';
import OutputPanel from './OutputPanel';
import AIVideoTab from './AIVideoTab';
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

export default function MediaStudio() {
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [advancedTab, setAdvancedTab] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState('TikTok');
  const [inputProps, setInputProps] = useState({ ...DEFAULT_PROPS });
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [legacyLibraryOpen, setLegacyLibraryOpen] = useState(false);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <VideoLibraryIcon sx={{ color: '#10b981', fontSize: 28 }} />
          <Box>
            <Typography variant="h5" fontWeight={800} lineHeight={1.1}>Media Studio</Typography>
            <Typography variant="body2" color="text.secondary">
              Describe what you need — get videos, posters, and flyers for SoldiKeeper
            </Typography>
          </Box>
        </Box>
        <Button variant="outlined" startIcon={<FolderIcon />} onClick={() => setLibraryOpen(true)}>
          Asset Library
        </Button>
      </Box>

      <PipelineHealthBanner />

      <CreateWizard onOpenLibrary={() => setLibraryOpen(true)} />

      <Accordion sx={{ mt: 3 }} defaultExpanded={false}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>Advanced tools (manual Remotion & AI Video)</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Tabs value={advancedTab} onChange={(_, v) => setAdvancedTab(v)} sx={{ mb: 2 }}>
            <Tab label="Remotion Studio" />
            <Tab label="AI Video" />
          </Tabs>

          {advancedTab === 0 && (
            <Box>
              <TemplatePicker selected={selectedTemplate} onSelect={setSelectedTemplate} />
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mt: 2 }}>
                <ContentEditor
                  inputProps={inputProps}
                  onPropsChange={setInputProps}
                  onOpenAI={() => setAiDrawerOpen(true)}
                />
                <Box>
                  <PreviewPane compositionId={selectedTemplate} inputProps={inputProps} />
                  <Box sx={{ mt: 2 }}>
                    <OutputPanel
                      compositionId={selectedTemplate}
                      inputProps={inputProps}
                      onOpenLibrary={() => setLegacyLibraryOpen(true)}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
          )}

          {advancedTab === 1 && <AIVideoTab />}
        </AccordionDetails>
      </Accordion>

      <UnifiedAssetLibrary open={libraryOpen} onClose={() => setLibraryOpen(false)} />
      <AIBriefDrawer
        open={aiDrawerOpen}
        onClose={() => setAiDrawerOpen(false)}
        selectedTemplate={selectedTemplate}
        inputProps={inputProps}
        onApply={(generated) => setInputProps((p) => ({ ...p, ...generated }))}
      />
      <VideoLibraryDrawer open={legacyLibraryOpen} onClose={() => setLegacyLibraryOpen(false)} />
    </Box>
  );
}