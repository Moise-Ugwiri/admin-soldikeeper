/* eslint-disable */
import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
  IconButton,
  Tooltip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { AutoAwesome, ExpandMore, ExpandLess, ContentCopy, Check } from '@mui/icons-material';
import {
  draftNotificationAI,
  draftHelpArticleAI,
  generateTemplateAI,
  analyzeSupportTicketAI,
} from '../../services/growthAPI';
import { draftCampaign } from '../../services/growthAPI';

const AI_PURPLE = '#7C4DFF';
const AI_GREEN = '#00C853';

const PanelWrapper = ({ children }) => (
  <Box
    sx={{
      background: `linear-gradient(135deg, ${alpha(AI_PURPLE, 0.08)} 0%, ${alpha('#3b82f6', 0.06)} 100%)`,
      border: `1.5px solid ${alpha(AI_PURPLE, 0.22)}`,
      borderRadius: 2.5,
      p: 2.5,
      mb: 1,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
      <AutoAwesome sx={{ color: AI_PURPLE, fontSize: 20 }} />
      <Typography variant="subtitle2" fontWeight={700} sx={{ color: AI_PURPLE }}>
        AI Assistant ✨
      </Typography>
    </Box>
    {children}
  </Box>
);

const ResultBox = ({ children, onApply, applyLabel = 'Apply to Form ↑' }) => (
  <Box
    sx={{
      mt: 2,
      p: 2,
      background: alpha(AI_GREEN, 0.07),
      border: `1px solid ${alpha(AI_GREEN, 0.3)}`,
      borderRadius: 2,
    }}
  >
    {children}
    {onApply && (
      <Button
        variant="contained"
        size="small"
        onClick={onApply}
        sx={{
          mt: 1.5,
          background: `linear-gradient(135deg, ${AI_PURPLE} 0%, #3b82f6 100%)`,
          fontWeight: 700,
        }}
      >
        {applyLabel}
      </Button>
    )}
  </Box>
);

// ─── AINotificationDrafter ───────────────────────────────────────────────────
export const AINotificationDrafter = ({ onResult }) => {
  const [context, setContext] = useState('');
  const [audience, setAudience] = useState('all');
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(true);

  const audiences = ['all', 'free', 'standard', 'premium', 'family', 'business'];

  const handleGenerate = async () => {
    if (!context.trim()) return;
    setLoading(true);
    setError('');
    setDraft(null);
    try {
      const res = await draftNotificationAI({ context, audience });
      setDraft(res.data?.draft || res.data);
      setExpanded(true);
    } catch (e) {
      setError(e?.response?.data?.message || 'AI generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PanelWrapper>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Typography variant="body2" color="text.secondary">
          Describe what to notify users about
        </Typography>
        <IconButton size="small" onClick={() => setExpanded(v => !v)}>
          {expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
        </IconButton>
      </Box>
      <Collapse in={expanded}>
        <TextField
          fullWidth
          size="small"
          label="What should users know about?"
          value={context}
          onChange={e => setContext(e.target.value)}
          multiline
          minRows={2}
          sx={{ mb: 1.5 }}
        />
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
          {audiences.map(a => (
            <Chip
              key={a}
              label={a.charAt(0).toUpperCase() + a.slice(1)}
              size="small"
              onClick={() => setAudience(a)}
              color={audience === a ? 'secondary' : 'default'}
              sx={{ cursor: 'pointer', ...(audience === a && { background: AI_PURPLE, color: '#fff' }) }}
            />
          ))}
        </Box>
        <Button
          variant="contained"
          size="small"
          onClick={handleGenerate}
          disabled={loading || !context.trim()}
          startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <AutoAwesome />}
          sx={{ background: `linear-gradient(135deg, ${AI_PURPLE} 0%, #3b82f6 100%)`, fontWeight: 700 }}
        >
          {loading ? 'Generating…' : 'Generate with AI ✨'}
        </Button>
        {error && <Alert severity="error" sx={{ mt: 1.5 }}>{error}</Alert>}
        {draft && (
          <ResultBox onApply={() => onResult && onResult(draft)}>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>DRAFT RESULT</Typography>
            {draft.title && <Typography variant="body2" fontWeight={700} sx={{ mt: 0.5 }}>{draft.title}</Typography>}
            {draft.message && <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>{draft.message}</Typography>}
            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              {draft.bestSendTime && <Chip label={`Best time: ${draft.bestSendTime}`} size="small" color="info" />}
              {draft.predictedOpenRate && <Chip label={`~${draft.predictedOpenRate} open rate`} size="small" color="success" />}
              {draft.type && <Chip label={draft.type} size="small" />}
            </Box>
          </ResultBox>
        )}
      </Collapse>
    </PanelWrapper>
  );
};

// ─── AICampaignDrafter ───────────────────────────────────────────────────────
export const AICampaignDrafter = ({ onResult }) => {
  const [objective, setObjective] = useState('');
  const [tone, setTone] = useState('friendly');
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(true);

  const tones = ['friendly', 'urgent', 'professional'];
  const objectives = ['re-engagement', 'upsell', 'onboarding', 'announcement', 'winback', 'feature launch'];

  const handleGenerate = async () => {
    if (!objective) return;
    setLoading(true);
    setError('');
    setDraft(null);
    try {
      const res = await draftCampaign({ objective, tone });
      setDraft(res.data?.draft || res.data);
    } catch (e) {
      setError(e?.response?.data?.message || 'AI generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PanelWrapper>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Typography variant="body2" color="text.secondary">
          Let AI draft your campaign
        </Typography>
        <IconButton size="small" onClick={() => setExpanded(v => !v)}>
          {expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
        </IconButton>
      </Box>
      <Collapse in={expanded}>
        <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
          <InputLabel>Objective</InputLabel>
          <Select value={objective} label="Objective" onChange={e => setObjective(e.target.value)}>
            {objectives.map(o => (
              <MenuItem key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1).replace('-', ' ')}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
          {tones.map(t => (
            <Chip
              key={t}
              label={t.charAt(0).toUpperCase() + t.slice(1)}
              size="small"
              onClick={() => setTone(t)}
              sx={{ cursor: 'pointer', ...(tone === t && { background: AI_PURPLE, color: '#fff' }) }}
            />
          ))}
        </Box>
        <Button
          variant="contained"
          size="small"
          onClick={handleGenerate}
          disabled={loading || !objective}
          startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <AutoAwesome />}
          sx={{ background: `linear-gradient(135deg, ${AI_PURPLE} 0%, #3b82f6 100%)`, fontWeight: 700 }}
        >
          {loading ? 'Generating…' : 'Generate with AI ✨'}
        </Button>
        {error && <Alert severity="error" sx={{ mt: 1.5 }}>{error}</Alert>}
        {draft && (
          <ResultBox onApply={() => onResult && onResult(draft)}>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>DRAFT RESULT</Typography>
            {draft.subject && <Typography variant="body2" fontWeight={700} sx={{ mt: 0.5 }}>{draft.subject}</Typography>}
            {draft.previewText && <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>{draft.previewText}</Typography>}
            {draft.body && (
              <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary', maxHeight: 80, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {draft.body.slice(0, 200)}…
              </Typography>
            )}
          </ResultBox>
        )}
      </Collapse>
    </PanelWrapper>
  );
};

// ─── AIContentDrafter ────────────────────────────────────────────────────────
export const AIContentDrafter = ({ onResult }) => {
  const [topic, setTopic] = useState('');
  const [userQuestion, setUserQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(true);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError('');
    setDraft(null);
    try {
      const res = await draftHelpArticleAI({ topic, userQuestion });
      setDraft(res.data?.draft || res.data);
    } catch (e) {
      setError(e?.response?.data?.message || 'AI generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PanelWrapper>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Typography variant="body2" color="text.secondary">
          Let AI write your help article
        </Typography>
        <IconButton size="small" onClick={() => setExpanded(v => !v)}>
          {expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
        </IconButton>
      </Box>
      <Collapse in={expanded}>
        <TextField
          fullWidth
          size="small"
          label="What is this article about?"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          sx={{ mb: 1.5 }}
        />
        <TextField
          fullWidth
          size="small"
          label="What question does this answer?"
          value={userQuestion}
          onChange={e => setUserQuestion(e.target.value)}
          sx={{ mb: 1.5 }}
        />
        <Button
          variant="contained"
          size="small"
          onClick={handleGenerate}
          disabled={loading || !topic.trim()}
          startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <AutoAwesome />}
          sx={{ background: `linear-gradient(135deg, ${AI_PURPLE} 0%, #3b82f6 100%)`, fontWeight: 700 }}
        >
          {loading ? 'Generating…' : 'Generate with AI ✨'}
        </Button>
        {error && <Alert severity="error" sx={{ mt: 1.5 }}>{error}</Alert>}
        {draft && (
          <ResultBox onApply={() => onResult && onResult(draft)}>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>DRAFT RESULT</Typography>
            {draft.title && <Typography variant="body2" fontWeight={700} sx={{ mt: 0.5 }}>{draft.title}</Typography>}
            {draft.summary && <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>{draft.summary}</Typography>}
            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              {draft.estimatedReadTime && <Chip label={`~${draft.estimatedReadTime} read`} size="small" color="info" />}
              {(draft.tags || []).map(tag => <Chip key={tag} label={tag} size="small" />)}
            </Box>
          </ResultBox>
        )}
      </Collapse>
    </PanelWrapper>
  );
};

// ─── AITemplateDrafter ───────────────────────────────────────────────────────
export const AITemplateDrafter = ({ onResult }) => {
  const [description, setDescription] = useState('');
  const [type, setType] = useState('notification');
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(true);

  const handleGenerate = async () => {
    if (!description.trim()) return;
    setLoading(true);
    setError('');
    setDraft(null);
    try {
      const res = await generateTemplateAI({ description, type });
      setDraft(res.data?.template || res.data);
    } catch (e) {
      setError(e?.response?.data?.message || 'AI generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PanelWrapper>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Typography variant="body2" color="text.secondary">
          Generate a template with AI
        </Typography>
        <IconButton size="small" onClick={() => setExpanded(v => !v)}>
          {expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
        </IconButton>
      </Box>
      <Collapse in={expanded}>
        <TextField
          fullWidth
          size="small"
          label="Describe the template"
          value={description}
          onChange={e => setDescription(e.target.value)}
          multiline
          minRows={2}
          sx={{ mb: 1.5 }}
        />
        <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
          <InputLabel>Type</InputLabel>
          <Select value={type} label="Type" onChange={e => setType(e.target.value)}>
            <MenuItem value="notification">Notification</MenuItem>
            <MenuItem value="campaign">Email Campaign</MenuItem>
            <MenuItem value="help">Help Article</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          size="small"
          onClick={handleGenerate}
          disabled={loading || !description.trim()}
          startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <AutoAwesome />}
          sx={{ background: `linear-gradient(135deg, ${AI_PURPLE} 0%, #3b82f6 100%)`, fontWeight: 700 }}
        >
          {loading ? 'Generating…' : 'Generate with AI ✨'}
        </Button>
        {error && <Alert severity="error" sx={{ mt: 1.5 }}>{error}</Alert>}
        {draft && (
          <ResultBox onApply={() => onResult && onResult(draft)}>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>TEMPLATE PREVIEW</Typography>
            {draft.name && <Typography variant="body2" fontWeight={700} sx={{ mt: 0.5 }}>{draft.name}</Typography>}
            {draft.body && (
              <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary', maxHeight: 80, overflow: 'hidden' }}>
                {draft.body.slice(0, 200)}
              </Typography>
            )}
            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              {(draft.tags || []).map(tag => <Chip key={tag} label={tag} size="small" />)}
            </Box>
          </ResultBox>
        )}
      </Collapse>
    </PanelWrapper>
  );
};

// ─── AISupportAnalyzer ───────────────────────────────────────────────────────
export const AISupportAnalyzer = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [userPlan, setUserPlan] = useState('free');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const plans = ['free', 'standard', 'premium', 'family', 'business'];

  const priorityColor = { low: 'success', medium: 'warning', high: 'error', critical: 'error' };
  const sentimentColor = { positive: 'success', neutral: 'info', negative: 'warning', frustrated: 'error' };

  const handleAnalyze = async () => {
    if (!title.trim() || !description.trim()) return;
    setLoading(true);
    setError('');
    setAnalysis(null);
    try {
      const res = await analyzeSupportTicketAI({ title, description, userPlan });
      setAnalysis(res.data?.analysis || res.data);
    } catch (e) {
      setError(e?.response?.data?.message || 'AI analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyReply = () => {
    if (analysis?.suggestedReply) {
      navigator.clipboard.writeText(analysis.suggestedReply);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Box
      sx={{
        background: `linear-gradient(135deg, ${alpha(AI_PURPLE, 0.08)} 0%, ${alpha('#3b82f6', 0.06)} 100%)`,
        border: `1.5px solid ${alpha(AI_PURPLE, 0.22)}`,
        borderRadius: 2.5,
        p: 2.5,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <AutoAwesome sx={{ color: AI_PURPLE, fontSize: 20 }} />
        <Typography variant="subtitle2" fontWeight={700} sx={{ color: AI_PURPLE }}>
          AI Ticket Analyzer 🤖
        </Typography>
      </Box>
      <TextField
        fullWidth
        size="small"
        label="Ticket Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        sx={{ mb: 1.5 }}
      />
      <TextField
        fullWidth
        size="small"
        label="Ticket Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
        multiline
        minRows={3}
        sx={{ mb: 1.5 }}
      />
      <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
        <InputLabel>User Plan</InputLabel>
        <Select value={userPlan} label="User Plan" onChange={e => setUserPlan(e.target.value)}>
          {plans.map(p => (
            <MenuItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button
        fullWidth
        variant="contained"
        size="small"
        onClick={handleAnalyze}
        disabled={loading || !title.trim() || !description.trim()}
        startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <AutoAwesome />}
        sx={{ background: `linear-gradient(135deg, ${AI_PURPLE} 0%, #3b82f6 100%)`, fontWeight: 700 }}
      >
        {loading ? 'Analyzing…' : 'Analyze Ticket with AI 🤖'}
      </Button>
      {error && <Alert severity="error" sx={{ mt: 1.5 }}>{error}</Alert>}
      {analysis && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            background: alpha(AI_GREEN, 0.07),
            border: `1px solid ${alpha(AI_GREEN, 0.3)}`,
            borderRadius: 2,
          }}
        >
          <Typography variant="caption" color="text.secondary" fontWeight={700}>ANALYSIS RESULT</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
            {analysis.classification && (
              <Chip label={analysis.classification} size="small" color="primary" />
            )}
            {analysis.priority && (
              <Chip label={`Priority: ${analysis.priority}`} size="small" color={priorityColor[analysis.priority] || 'default'} />
            )}
            {analysis.sentiment && (
              <Chip label={`Sentiment: ${analysis.sentiment}`} size="small" color={sentimentColor[analysis.sentiment] || 'default'} />
            )}
            {analysis.escalate && (
              <Chip label="⚠ Escalate" size="small" color="error" />
            )}
          </Box>
          {analysis.suggestedReply && (
            <Box sx={{ mt: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary">SUGGESTED REPLY</Typography>
                <Tooltip title={copied ? 'Copied!' : 'Copy Reply'}>
                  <IconButton size="small" onClick={handleCopyReply}>
                    {copied ? <Check fontSize="small" sx={{ color: AI_GREEN }} /> : <ContentCopy fontSize="small" />}
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'pre-wrap', fontSize: '0.8rem' }}>
                {analysis.suggestedReply}
              </Typography>
            </Box>
          )}
          {analysis.internalNote && (
            <Box sx={{ mt: 1.5, p: 1, background: alpha('#ff9800', 0.1), borderRadius: 1 }}>
              <Typography variant="caption" fontWeight={700} color="warning.main">INTERNAL NOTE</Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary', mt: 0.5 }}>
                {analysis.internalNote}
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};
