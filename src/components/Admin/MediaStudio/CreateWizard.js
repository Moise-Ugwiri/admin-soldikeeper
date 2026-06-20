import React, { useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Stepper, Step, StepLabel,
  ToggleButtonGroup, ToggleButton, Stack, CircularProgress, Alert,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import { planMedia, createMedia } from './api';
import useMediaJob from './hooks/useMediaJob';
import PlanReviewCard from './PlanReviewCard';
import BrandAssetManager from './BrandAssetManager';
import AssetResultPanel from './AssetResultPanel';

const STEPS = ['Describe', 'Review plan', 'Generate', 'Result'];
const PURPOSES = ['marketing', 'educational', 'operational'];

export default function CreateWizard({ onOpenLibrary }) {
  const [step, setStep] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [purpose, setPurpose] = useState('marketing');
  const [plan, setPlan] = useState(null);
  const [planMeta, setPlanMeta] = useState(null);
  const [brandAssetIds, setBrandAssetIds] = useState([]);
  const [jobId, setJobId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { job, error: jobError } = useMediaJob(step >= 2 ? jobId : null);

  const handlePlan = async () => {
    if (prompt.trim().length < 8) return;
    setLoading(true);
    setError(null);
    try {
      const result = await planMedia({ prompt: prompt.trim(), purpose, brandAssetIds });
      const nextPlan = {
        ...result.plan,
        inputProps: {
          ...result.plan.inputProps,
          screenshotIds: brandAssetIds,
        },
      };
      setPlan(nextPlan);
      setPlanMeta({ fromFallback: result.fromFallback, message: result.message });
      setStep(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!plan) return;
    setLoading(true);
    setError(null);
    try {
      const result = await createMedia({
        prompt: prompt.trim(),
        plan: {
          ...plan,
          inputProps: { ...plan.inputProps, screenshotIds: brandAssetIds },
        },
        purpose,
        brandAssetIds,
      });
      setJobId(result.jobId);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (step === 2 && job && ['done', 'failed'].includes(job.status)) {
      setStep(3);
    }
  }, [job, step]);

  const reset = () => {
    setStep(0);
    setPlan(null);
    setPlanMeta(null);
    setJobId(null);
    setError(null);
  };

  return (
    <Box>
      <Stepper activeStep={step} alternativeLabel sx={{ mb: 3 }}>
        {STEPS.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
      </Stepper>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      {step === 0 && (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <AutoAwesomeIcon sx={{ color: '#10b981' }} />
            <Typography variant="h6" fontWeight={700}>What do you want to create?</Typography>
          </Box>
          <TextField
            fullWidth multiline rows={4}
            placeholder="e.g. 30s TikTok ad showing receipt scanning for students, or a square poster announcing SplitSmart bill splitting"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>Purpose</Typography>
          <ToggleButtonGroup
            value={purpose}
            exclusive
            onChange={(_, v) => v && setPurpose(v)}
            size="small"
            sx={{ mb: 3 }}
          >
            {PURPOSES.map((p) => (
              <ToggleButton key={p} value={p} sx={{ textTransform: 'capitalize' }}>{p}</ToggleButton>
            ))}
          </ToggleButtonGroup>

          <BrandAssetManager selectedIds={brandAssetIds} onSelectionChange={setBrandAssetIds} />

          <Button
            variant="contained"
            size="large"
            fullWidth
            sx={{ mt: 3, bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <AutoAwesomeIcon />}
            disabled={prompt.trim().length < 8 || loading}
            onClick={handlePlan}
          >
            Plan my media
          </Button>
        </Paper>
      )}

      {step === 1 && plan && (
        <Box>
          <PlanReviewCard plan={plan} onChange={setPlan} fromFallback={planMeta?.fromFallback} />
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button variant="outlined" onClick={() => setStep(0)}>Back</Button>
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <VideoLibraryIcon />}
              onClick={handleGenerate}
              disabled={loading}
              sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
            >
              Generate
            </Button>
          </Stack>
        </Box>
      )}

      {(step === 2 || step === 3) && (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <AssetResultPanel
            job={job}
            error={jobError}
            onCreateAnother={reset}
          />
          {step === 3 && (
            <Button sx={{ mt: 2 }} onClick={onOpenLibrary}>Open Asset Library</Button>
          )}
        </Paper>
      )}
    </Box>
  );
}